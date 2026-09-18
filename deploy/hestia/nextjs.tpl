# Hestia proxy template: shresthahotel.hashtagweb.com.np -> Next.js in Docker (127.0.0.1:3200)
# Install: cp nextjs.tpl nextjs.stpl /usr/local/hestia/data/templates/web/nginx/
# Then panel: Web > Edit domain > Proxy Template = nextjs (rebuilds nginx).
server {
	listen      %ip%:%proxy_port%;
	server_name %domain_idn% %alias_idn%;
	error_log   /var/log/%web_system%/domains/%domain%.error.log error;
	client_max_body_size 64m;

	include %home%/%user%/conf/web/%domain%/nginx.forcessl.conf*;

	location ~ /\.(?!well-known\/) {
		deny all;
		return 404;
	}

	# WordPress lives in the docroot alongside nothing else — only these
	# paths go to Hestia's Apache/PHP backend. Everything else → Node.
	# Admin: /wp-admin, API: /graphql. Never add app routes under /wp-*.
	location = /wp-admin { return 301 /wp-admin/; }
	location ^~ /wp-admin/ {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location ^~ /wp-content/ {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location ^~ /wp-includes/ {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location ^~ /wp-json/ {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location = /wp-login.php {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location = /wp-cron.php {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location = /graphql {
		proxy_pass http://%ip%:%web_port%;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
	location = /xmlrpc.php { deny all; }

	location / {
		proxy_pass http://127.0.0.1:3200;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_cache_bypass $http_upgrade;
	}

	location /error/ {
		alias %home%/%user%/web/%domain%/document_errors/;
	}

	include %home%/%user%/conf/web/%domain%/nginx.conf_*;
}
