# KMail API Summary

## Auth Routes
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/password-update

## Message Routes
- POST /messages/send
- GET /messages/inbox
- GET /messages/sent
- GET /messages/:id
- DELETE /messages

## Attachments
- POST /attachments/upload
- GET /attachments/:id

## Public
- GET /health
