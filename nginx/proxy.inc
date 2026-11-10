proxy_pass http://portfolio-api:8080;
proxy_http_version 1.1;
proxy_set_header Connection "";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $client_ip;   # always overwritten: a client-sent value never reaches the API
proxy_set_header X-Forwarded-For $client_ip;
proxy_hide_header Content-Security-Policy; # the server-level headers apply
proxy_hide_header X-Content-Type-Options;
proxy_hide_header Referrer-Policy;
proxy_connect_timeout 3s;
proxy_read_timeout 15s;
