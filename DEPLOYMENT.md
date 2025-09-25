# Deployment Guide

This document explains how to deploy the B4U Esports application to different environments.

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account
2. A Vercel account
3. Required environment variables (see below)
4. Pi Network Developer Portal account (for Pi integration)

## Environment Variables

You need to set the following environment variables in your deployment environment:

### Required Variables

```
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id
EMAILJS_PUBLIC_KEY=your_public_key
ADMIN_EMAIL=admin@b4uesports.com

# Pi Network (Get from Pi Developer Portal)
PI_API_KEY=your_pi_api_key
PI_SECRET=your_pi_secret

# Database (PostgreSQL connection string)
DATABASE_URL=your_database_url

# JWT (For token generation)
JWT_SECRET=your_jwt_secret
```

### Development vs Production

For development environments, you can use test keys from Pi Network's sandbox environment.
For production, you need real keys from Pi Network's production environment.

## Vercel Deployment

### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Select the repository when prompted
3. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm run vercel-build`
   - Output Directory: dist
4. Add environment variables in the Vercel project settings
5. Deploy!

### Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Environment-Specific Deployment

### Development Deployment

For development and testing:

1. Use sandbox keys from Pi Network Developer Portal
2. Set `NODE_ENV=development`
3. Use a development database

### Production Deployment

For production:

1. Use production keys from Pi Network Developer Portal
2. Set `NODE_ENV=production`
3. Use a production database
4. Ensure all security measures are in place

## Post-Deployment Checklist

After deployment, verify that:

1. [ ] Application loads without errors
2. [ ] Authentication works in all supported environments
3. [ ] API endpoints are accessible
4. [ ] Database connections are working
5. [ ] Email notifications are functioning
6. [ ] Pi Network integration is working (in supported environments)
7. [ ] All environment variables are correctly set

## Monitoring and Maintenance

### Error Monitoring

Set up error monitoring for your deployment:

1. Check Vercel logs for build and runtime errors
2. Monitor browser console for client-side errors
3. Set up server-side error logging

### Performance Monitoring

Monitor application performance:

1. Use Vercel Analytics
2. Monitor database performance
3. Track API response times

### Security Updates

Regularly update dependencies:

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update
```

## Troubleshooting Deployment Issues

### Build Failures

If the build fails:

1. Check the build logs in Vercel
2. Verify all dependencies are correctly installed
3. Ensure environment variables are set
4. Check for TypeScript/JavaScript errors

### Runtime Errors

If the application fails at runtime:

1. Check browser console for errors
2. Verify environment variables are correctly loaded
3. Check network requests for failed API calls
4. Review server logs for backend errors

### Database Connection Issues

If there are database connection problems:

1. Verify DATABASE_URL is correctly set
2. Check that the database server is accessible
3. Ensure database credentials are correct
4. Verify database schema is up to date

### Pi Network Integration Issues

If Pi Network integration is not working:

1. Verify PI_API_KEY and PI_SECRET are correctly set
2. Check that the application is using the correct environment (sandbox vs production)
3. Verify that Pi SDK is properly loaded (or mock auth is working)
4. Check Pi Network Developer Portal for any issues with your app

## Rollback Procedure

If you need to rollback a deployment:

1. In Vercel, go to your project deployments
2. Find the previous working deployment
3. Click "Promote to Production"
4. Monitor the application to ensure it's working correctly

## Scaling Considerations

For high-traffic deployments:

1. Consider database connection pooling
2. Implement caching for frequently accessed data
3. Use CDN for static assets
4. Monitor resource usage and scale accordingly