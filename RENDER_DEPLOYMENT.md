# Render Deployment Guide

This guide explains how to deploy the B4U Esports application to Render.

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account
2. A Render account
3. Required environment variables (see below)
4. Pi Network Developer Portal account (for Pi integration)

## Render Deployment Steps

### 1. Connect GitHub Repository

1. Go to the Render Dashboard
2. Click "New Web Service"
3. Connect your GitHub account
4. Select the B4U Esports repository

### 2. Configure the Service

Render will automatically detect the `render.yaml` file and configure the services accordingly:

- **Frontend Service**: Serves the React application
- **API Service**: Handles backend API requests

### 3. Set Environment Variables

In the Render dashboard, go to your service settings and add the following environment variables:

```
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id
EMAILJS_PUBLIC_KEY=your_public_key
ADMIN_EMAIL=admin@b4uesports.com

# Pi Network
PI_SECRET_KEY=your_pi_secret_key
PI_SERVER_API_KEY=your_pi_server_api_key

# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret

# Node Environment
NODE_ENV=production
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any issues

## Health Checks

Render will automatically check the `/health` endpoint to monitor your application's status.

## Custom Domain (Optional)

If you want to use a custom domain:

1. In the Render dashboard, go to your service settings
2. Click "Custom Domains"
3. Add your custom domain
4. Follow the instructions to configure DNS

## Monitoring and Logs

Render provides built-in monitoring and logging:

1. View logs in the Render dashboard
2. Set up alerts for downtime or performance issues
3. Monitor resource usage (CPU, memory, disk)

## Scaling

Render automatically scales your application based on traffic. For high-traffic applications:

1. Consider upgrading to a paid plan
2. Enable auto-scaling
3. Monitor performance metrics

## Troubleshooting

### Build Failures

If the build fails:

1. Check the build logs in the Render dashboard
2. Verify all dependencies are correctly installed
3. Ensure environment variables are set
4. Check for TypeScript/JavaScript errors

### Runtime Errors

If the application fails at runtime:

1. Check the application logs in the Render dashboard
2. Verify environment variables are correctly loaded
3. Check network requests for failed API calls
4. Review server logs for backend errors

### Database Connection Issues

If there are database connection problems:

1. Verify DATABASE_URL is correctly set
2. Check that the database server is accessible
3. Ensure database credentials are correct
4. Verify database schema is up to date

## Rollback

If you need to rollback a deployment:

1. In the Render dashboard, go to your service deployments
2. Find the previous working deployment
3. Click "Rollback to this deployment"
4. Monitor the application to ensure it's working correctly