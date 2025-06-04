## Simple web app in C# i React

### Important information
Unfortunetly I didn't make this project in time. Majority of code have low quality and althought code theoreticly works, it is buggy. Because of not having enought time most of frontend was made with heavy use of AI. Despite this, I do understand how this project works. 

### Backend 
 - contains two controllers for CRUD operations on ContactInfo and Category
 - JWT, authentication and authorization configuration
 - DB for bussines data
 - DB for authentication

### Frontend
 - written in ts
 - 5 main page components (authorization, create, details, all contacts, update)
 - spa

### Used libraries
#### C#
- "Microsoft.AspNetCore.Authentication.JwtBearer" - used for authentication, to generate Json Web Token
- "Microsoft.AspNetCore.Identity.EntityFrameworkCore" - used for ORM
- "Npgsql.EntityFrameworkCore.PostgreSQL" - used to communicate with postgresql

#### React
- vite - for simple project creation
- react-router-dom - for navigation and routing

  ### Run
  - go to netpc_demo/backendSln/backend
  - update connection string to your db
  - 'dotnet run'
 
  - open diffrent terminal
  - go to netpc_demo/frontend/
  - npm run dev

  -login info: admin, Password123!
 
### Things that should be done
- data vaidation
- simple css
- more comments
- less redundancy, more components in react
- important info should be stored safely, admin password, JWT secret
  
