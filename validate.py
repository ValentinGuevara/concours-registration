import boto3
import json
import uuid

print("Loading function")
dynamo = boto3.client("dynamodb")
table = dynamo.Table('concours')

def lambda_handler(event, context):
    # Extract the id from the event
    item_id = event["pathParameters"]["id"]
    
    # Make sure we got the id in the event
    if not item_id:
        return {
            'statusCode': 400,
            'body': json.dumps('Error: Missing item id')
        }
    
    try:
        # Get the item from DynamoDB by id
        response = table.get_item(Key={'id': item_id})
        
        # Check if the item exists
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps(f"Item with id {item_id} not found")
            }
        
        item = response['Item']
        
        # Check if the status is "pending"
        if item.get('status') == 'pending':
            # Update the status to "processed"
            update_response = table.update_item(
                Key={'id': item_id},
                UpdateExpression="set #status = :status",
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': 'processed'},
                ReturnValues="UPDATED_NEW"
            )
            
            return {
                'statusCode': 200,
                'body': json.dumps(f"Item updated: {update_response['Attributes']}")
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps(f"Item status is not 'pending'. Current status: {item.get('status')}")
            }
    
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating item: {e.response['Error']['Message']}")
        }