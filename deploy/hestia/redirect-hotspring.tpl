# Redirect legacy hotel domain to the migrated canonical domain.
server {
	listen      %ip%:%proxy_port%;
	server_name %domain_idn% %alias_idn%;
	error_log   %home%/%user%/web/%domain%/logs/%domain%.error.log error;

	include %home%/%user%/conf/web/%domain%/nginx.forcessl.conf*;
	return 301 https://shresthahotelhotspring.com$request_uri;

	include %home%/%user%/conf/web/%domain%/nginx.conf_*;
}
