# MovieLocation

MovieLocation is a website where users can create and review movie locations. In order to review or create a locatiion, you must have an account.  

This project was created using Node.js, Express, MongoDB, and Bootstrap. Passport.js was used to handle authentication.  

## Features
* Users can create, edit, and remove locations
* Users can review location once, and edit or remove their review
* User profiles include more information on the user (full name, email, phone, join date), their locations, and the option to edit their profile or delete their account
* Search movie location by name or location
* Sort location by highest rating, most reviewed, lowest price, or highest price

## Screenshots
![image](https://user-images.githubusercontent.com/17989060/108547832-ff032800-7310-11eb-8122-11c737046b13.png)

![image](https://user-images.githubusercontent.com/17989060/108548147-6ae59080-7311-11eb-8de6-87d399c2966c.png)

![image](https://user-images.githubusercontent.com/17989060/108548221-8a7cb900-7311-11eb-812c-e8eb9cb5a44b.png)

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

