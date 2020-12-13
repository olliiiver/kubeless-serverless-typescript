
This FaaS example deploys a Typescript function to Kubernetes via Serverless and Kubeless on a local k3d cluster on Docker. Real live coding is also possible via serverless offline. 

I tried this example on a Mac. Other hosts might also possbile.

# Prerequisites

You need to have the following installed locally.

- Docker 
- k3d (https://github.com/rancher/k3d)
- Serverless (https://www.serverless.com/framework/docs/getting-started/)

# Install Kubernetes 

Create a new cluster.

```
k3d cluster create --api-port 6550 -p "8080:80@loadbalancer"  --k3s-server-arg '--no-deploy=traefik'
```

Install Nginx as ingress controller.

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.2/deploy/static/provider/cloud/deploy.yaml
```

# Install Kubeless

Install Kubeless on the previously created Kubernetes cluster.

```
export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
kubectl create ns kubeless
kubectl create -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$RELEASE.yaml
```

# Install Kubernetes dashboard (optional)

The dashboard might help to find any issues ...

```
GITHUB_URL=https://github.com/kubernetes/dashboard/releases
VERSION_KUBE_DASHBOARD=$(curl -w '%{url_effective}' -I -L -s -S ${GITHUB_URL}/latest -o /dev/null | sed -e 's|.*/||')
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/${VERSION_KUBE_DASHBOARD}/aio/deploy/recommended.yaml
kubectl create -f dashboard.yaml
kubectl proxy &
```

After this, the dashboard should be available at ...

http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

Login by using the admin token from ...

```
kubectl -n kubernetes-dashboard describe secret admin-user-token | grep ^token
```


# Deploy example

Deploy the code example from this repository to Kubeless via Serverless.

```
cd example
npm install
serverless deploy
```

This should return the following output.

```
Serverless: Running "serverless" installed locally (in service node_modules)
Serverless: Configuration warning: Unrecognized provider 'kubeless'
Serverless:
Serverless: You're relying on provider plugin which doesn't provide a validation schema for its config.
Serverless: Please report the issue at its bug tracker linking: https://www.serverless.com/framework/docs/providers/aws/guide/plugins#extending-validation-schema
Serverless: You may turn off this message with "configValidationMode: off" setting
Serverless:
Serverless: Bundling with Webpack...
Time: 332ms
Built at: 12/13/2020 11:13:16 AM
         Asset      Size  Chunks                   Chunk Names
    handler.js  1.13 KiB       0  [emitted]        handler
handler.js.map  4.95 KiB       0  [emitted] [dev]  handler
Entrypoint handler = handler.js handler.js.map
[0] ./handler.ts 229 bytes {0} [built]
Serverless: Packaging service...
Serverless: Deploying function hello...
Serverless: Function hello successfully deployed
Serverless: Creating http trigger for: hello
```

You can get more information by typping ...

```
serverless info
```

... which should show ...

```
Service Information "hello"
Cluster IP:  10.43.16.172
Type:  ClusterIP
Ports:
  Name:  http-function-port
  Protocol:  TCP
  Port:  8080
  Target Port:  8080
Function Info
URL:  0.0.0.0.xip.io/hello
Labels:
  created-by: kubeless
  function: hello
Handler:  handler.hello
Runtime:  nodejs12
Dependencies:
```

You can now access the function via the following link.

http://0.0.0.0.xip.io:8080/hello?foo=bar


# Serverless offline

You can also work live "offline" on your code. Typescript compilation is done automatically in background.

Just type ...

```
serverless offline
```

... which should make available the following URL.

http://localhost:3000/hello?foo=bar
