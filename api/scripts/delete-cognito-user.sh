#!/bin/bash
aws cognito-idp admin-delete-user \
--user-pool-id us-east-1_JG6xnNFnn \
--username $1 \
--region us-east-1