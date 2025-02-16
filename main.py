import boto3
import json
import uuid

print("Loading function")
dynamo = boto3.client("dynamodb")


def marshall(data):
    boto3.resource("dynamodb")
    serializer = boto3.dynamodb.types.TypeSerializer()
    return {k: serializer.serialize(v) for k, v in data.items()}


def respond(err, res=None):
    return {
        "statusCode": "400" if err else "200",
        "body": err if err else json.dumps(res),
        "headers": {
            "Content-Type": "application/json",
        },
    }


def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    operation = event["requestContext"]["http"]["method"]
    if operation == "POST":
        params = json.loads(event["body"])
        number, name, email = params.values()
        unique_id = uuid.uuid4()
        item = marshall(
            {
                "PK_Number": str(number),
                "Name": name,
                "Email": email,
                "Validate_Number_Code": str(unique_id),
                "Status": "Pending",
            }
        )
        try:
            res = dynamo.put_item(
                TableName="concours",
                Item=item,
                ConditionExpression="PK_Number <> :number",
                ExpressionAttributeValues={":number": {"S": str(number)}},
            )
            return respond(None, res)
        except Exception as e:
            return respond("REGISTER_ONCE")
    else:
        return respond("REQUEST_METHOD_NOT_ALLOWED")
