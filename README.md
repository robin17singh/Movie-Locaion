# MovieLocation

MovieLocation is a website where users can create and review movie locations. In order to review or create a locatiion, you must have an account.  

This project was created using Node.js, Express, MongoDB, and Bootstrap. Passport.js was used to handle authentication.  

## Features
* Users can create, edit, and remove campgrounds
* Users can review location once, and edit or remove their review
* User profiles include more information on the user (full name, email, phone, join date), their locations, and the option to edit their profile or delete their account
* Search movie location by name or location
* Sort location by highest rating, most reviewed, lowest price, or highest price

## Run it locally
1. Install [mongodb](https://www.mongodb.com/)
2. Create a cloudinary account to get an API key and secret code

```
git clone https://github.com/robin17singh/Movie-Location.git
cd Movie-Location
npm install
```


Run ```mongod``` in another terminal and ```node app.js``` in the terminal with the project.  

Then go to [localhost:3000](http://localhost:3000/).

