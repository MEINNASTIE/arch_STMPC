import requests
import base64

def init_admin(username, password):
    user_pass = f"{username};{password}"
    
    hashB64 = base64.b64encode(user_pass.encode()).decode()

    url = f"https://localhost/api/user/initadmin?hash={hashB64}"
    
    try:
        response = requests.post(url, verify=False)

        if response.status_code == 200:
            payload = response.json()
            return payload
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

admin_payload = init_admin('admin', 'admin')

if admin_payload:
    print("Admin initialization successful:")
    print(admin_payload)
