import boto3
import json

dynamo = boto3.resource('dynamodb')
concours_table = dynamo.Table('concours')

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    number = event["queryStringParameters"]["number"]
    code = event["queryStringParameters"]["code"]
    
    if not number or not code:
        return {
            'statusCode': 400,
            'body': json.dumps('Error: Missing params')
        }
    
    number = str(number).replace('+','').replace(' ','')
    try:
        response = concours_table.get_item(Key={'PK_Number': number})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps(f"Item with number {number} not found")
            }
        
        existing_item = response['Item']
        
        if existing_item.get('Status') == 'Pending' and existing_item.get('Code') == code:
            concours_table.update_item(
                Key={'PK_Number': number},
                UpdateExpression="SET #status = :status REMOVE Code",
                ExpressionAttributeNames={'#status': 'Status'},
                ExpressionAttributeValues={':status': 'Validated'},
                ReturnValues="UPDATED_NEW"
            )
            
            return {
                'statusCode': 200,
                'body': json.dumps({"status": "ok"})
            }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps(f"ALREADY_VALIDATED_OR_WRONG_CODE")
            }
    
    except:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Server error")
        }