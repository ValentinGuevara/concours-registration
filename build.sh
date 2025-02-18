#!/bin/sh

uv tool run ruff format
zip -r dist/lambda_deploy_new_user.zip ./.venv/lib/python3.10/site-packages/*
zip dist/lambda_deploy_new_user.zip ./*.py
zip -r dist/twilio-aws-lambda.zip twilio-aws-lambda/*