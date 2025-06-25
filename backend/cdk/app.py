#!/usr/bin/env python3
"""
AWS CDK App for Serverless Payments Sandbox

This CDK application provisions the complete infrastructure for the
serverless payments sandbox including API Gateway, Lambda functions,
DynamoDB tables, SNS topics, and monitoring resources.
"""

import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_apigateway as apigateway,
    aws_lambda as lambda_,
    aws_dynamodb as dynamodb,
    aws_sns as sns,
    aws_stepfunctions as sfn,
    aws_cloudwatch as cloudwatch,
    aws_iam as iam,
    aws_logs as logs,
    Duration,
    RemovalPolicy,
)
from constructs import Construct


class PaymentsSandboxStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB Table for Payment Transactions
        self.payments_table = dynamodb.Table(
            self, "PaymentsLedger",
            table_name="payments-ledger",
            partition_key=dynamodb.Attribute(
                name="transaction_id",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,  # For development
            time_to_live_attribute="ttl",
            point_in_time_recovery=True,
        )

        # Global Secondary Index for card_id lookups
        self.payments_table.add_global_secondary_index(
            index_name="card_id_index",
            partition_key=dynamodb.Attribute(
                name="card_id",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.STRING
            ),
            projection_type=dynamodb.ProjectionType.ALL,
        )

        # SNS Topic for Webhooks
        self.webhook_topic = sns.Topic(
            self, "WebhookTopic",
            topic_name="payments-webhook-topic",
            display_name="Payments Webhook Topic"
        )

        # Lambda Function for Payment API
        self.payment_lambda = lambda_.Function(
            self, "PaymentAPI",
            function_name="payments-api",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=lambda_.Code.from_asset("src"),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={
                "PAYMENTS_TABLE": self.payments_table.table_name,
                "WEBHOOK_TOPIC_ARN": self.webhook_topic.topic_arn,
                "POWERTOOLS_SERVICE_NAME": "payments-api",
                "LOG_LEVEL": "INFO",
            },
            log_retention=logs.RetentionDays.ONE_WEEK,
        )

        # Grant permissions to Lambda
        self.payments_table.grant_read_write_data(self.payment_lambda)
        self.webhook_topic.grant_publish(self.payment_lambda)

        # API Gateway
        self.api = apigateway.RestApi(
            self, "PaymentsAPI",
            rest_api_name="payments-sandbox-api",
            description="Serverless Payments Sandbox API",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=["*"],  # Configure appropriately for production
                allow_methods=["GET", "POST", "PUT", "DELETE"],
                allow_headers=["*"],
            ),
            deploy_options=apigateway.StageOptions(
                stage_name="v1",
                throttling_rate_limit=100,
                throttling_burst_limit=200,
            )
        )

        # API Gateway Usage Plan for Rate Limiting
        usage_plan = self.api.add_usage_plan(
            "PaymentsUsagePlan",
            name="payments-sandbox-usage-plan",
            description="Usage plan for payments sandbox API",
            throttle=apigateway.ThrottleSettings(
                rate_limit=100,
                burst_limit=200
            ),
            quota=apigateway.QuotaSettings(
                limit=10000,
                period=apigateway.Period.DAY
            )
        )

        # API Key for authentication
        api_key = self.api.add_api_key(
            "PaymentsAPIKey",
            api_key_name="payments-sandbox-api-key",
            description="API key for payments sandbox"
        )

        usage_plan.add_api_key(api_key)

        # Lambda Integration
        lambda_integration = apigateway.LambdaIntegration(
            self.payment_lambda,
            request_templates={"application/json": '{ "statusCode": "200" }'}
        )

        # API Resources and Methods
        payments_resource = self.api.root.add_resource("payments")
        
        # Authorization endpoint
        authorize_resource = payments_resource.add_resource("authorize")
        authorize_resource.add_method(
            "POST",
            lambda_integration,
            api_key_required=True,
            request_parameters={
                "method.request.header.X-Idempotency-Key": True
            }
        )

        # Capture endpoint
        capture_resource = payments_resource.add_resource("capture")
        capture_resource.add_method(
            "POST",
            lambda_integration,
            api_key_required=True,
            request_parameters={
                "method.request.header.X-Idempotency-Key": True
            }
        )

        # Refund endpoint
        refund_resource = payments_resource.add_resource("refund")
        refund_resource.add_method(
            "POST",
            lambda_integration,
            api_key_required=True,
            request_parameters={
                "method.request.header.X-Idempotency-Key": True
            }
        )

        # Health check endpoint
        health_resource = self.api.root.add_resource("health")
        health_resource.add_method("GET", lambda_integration)

        # CloudWatch Dashboard
        dashboard = cloudwatch.Dashboard(
            self, "PaymentsDashboard",
            dashboard_name="payments-sandbox-dashboard",
        )

        # Add metrics to dashboard
        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="API Requests",
                left=[
                    self.api.metric_count(
                        period=Duration.minutes(5),
                        statistic="Sum"
                    )
                ]
            ),
            cloudwatch.GraphWidget(
                title="API Latency",
                left=[
                    self.api.metric_latency(
                        period=Duration.minutes(5),
                        statistic="p95"
                    )
                ]
            ),
            cloudwatch.GraphWidget(
                title="Lambda Errors",
                left=[
                    self.payment_lambda.metric_errors(
                        period=Duration.minutes(5),
                        statistic="Sum"
                    )
                ]
            )
        )

        # Output the API URL
        cdk.CfnOutput(
            self, "APIURL",
            value=self.api.url,
            description="Payments Sandbox API URL"
        )

        cdk.CfnOutput(
            self, "APIKey",
            value=api_key.key_id,
            description="API Key ID for authentication"
        )


def main():
    app = cdk.App()
    
    PaymentsSandboxStack(
        app, "ServerlessPaymentsSandbox",
        env=cdk.Environment(
            account=app.node.try_get_context("account"),
            region=app.node.try_get_context("region") or "us-east-1"
        ),
        description="Serverless Payments Sandbox - Complete infrastructure for payment simulation"
    )
    
    app.synth()


if __name__ == "__main__":
    main() 