#!/bin/sh

uv tool run ruff format
zip -r lambda_deploy.zip ./.venv/lib/python3.10/site-packages/*
zip lambda_deploy.zip ./*.py