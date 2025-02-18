import boto3
import json
import uuid

print("Loading function")
dynamo = boto3.client("dynamodb")
sqs = boto3.client("sqs")

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
                "SK_Id": str(unique_id),
                "Name": name,
                "Email": email,
                "Status": "Pending",
            }
        )
        try:
            print(item)
            res = dynamo.put_item(
                TableName="concours",
                Item=item,
                ConditionExpression="attribute_not_exists(PK_Number)",
            )

            message_resp = sqs.send_message(
                QueueUrl="https://sqs.eu-central-1.amazonaws.com/637423508544/SMS.fifo",
                MessageBody=json.dumps({
                    "number": str(number),
                    "email": email
                }),
                MessageGroupId="number"
            )

            print(f"Message sent successfully! Message ID: {message_resp['MessageId']}")
            
            return respond(None, res)
        except Exception as e:
            print(e)
            return respond("REGISTER_ONCE")
    else:
        return respond("REQUEST_METHOD_NOT_ALLOWED")
