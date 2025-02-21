import boto3
import json
import uuid
import os

dynamo = boto3.resource('dynamodb')
sqs = boto3.client("sqs")

def marshall(data):
    boto3.resource("dynamodb")
    serializer = boto3.dynamodb.types.TypeSerializer()
    return {k: serializer.serialize(v) for k, v in data.items()}


def respond(err, res=None):
    return {
        "isBase64Encoded": False,
        "statusCode": "400" if err else "200",
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        },
        "body": json.dumps({"reason": err}) if err else json.dumps(res),
    }


def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    operation = event["httpMethod"]
    if operation == "POST":
        params = json.loads(event["body"])
        number = str(params['number']).replace('+','').replace(' ','')
        name = params['name']
        email = params['email']

        concours_table = dynamo.Table('concours')
        response = concours_table.get_item(
            Key={
                "PK_Number": number
            }
        )
        existing_item = response.get('Item', None)

        if existing_item and os.environ["GAME_ON"] and os.environ["GAME_ON"] == "true":
            return respond("GAME_PLAY_ONCE")

        code = str(uuid.uuid4())[:6].lower()
        try:
            res = concours_table.put_item(
                Item={
                    "PK_Number": number,
                    "Name": name,
                    "Email": email,
                    "Code": code,
                    "Nb_Session": 5 if not existing_item else existing_item['Nb_Session'] + 1,
                    "Status": "Pending",
                }
            )

            message_resp = sqs.send_message(
                QueueUrl="https://sqs.eu-central-1.amazonaws.com/637423508544/SMS.fifo",
                MessageBody=json.dumps({
                    "number": '+' + number,
                    "email": email,
                    "code": code
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
