import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.message import EmailMessage

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    """Shows basic usage of the Gmail API.
    Sends a test email using the Gmail API.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Make sure 'credentials.json' is in the same folder as this script.
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build('gmail', 'v1', credentials=creds)
        
        # Create the email message
        message = EmailMessage()
        message.set_content('This is a test email from the MMULostHub Python script.')
        message['To'] = 'adminlosthub@gmail.com'
        message['From'] = 'adminlosthub@gmail.com'
        message['Subject'] = 'MMULostHub API Test Connection'

        # Encoded message for Gmail API
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        # Execute the send action
        send_message = (service.users().messages().send(userId="me", body={'raw': raw_message})
                       .execute())
        
        print(f'Message Id: {send_message["id"]}')
        print("Success! The test email has been sent to your inbox.")

    except Exception as error:
        print(f'An error occurred: {error}')

if __name__ == '__main__':
    main()