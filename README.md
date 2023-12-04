# SnakeMaker

A website focusing on the game 'Snake'. Angular and Realtime Database from Firebase were used to create the project.

## Table of contents
* [General info](#general-info)
* [Website hosting](#website-hosting)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)

## General info

The source of the project is the extended game 'Snake'. Additional functionality was based on this source, including the creation of custom maps. The project was created to consolidate and improve frontend skills using the Angular framework, and to become more familiar with the possibilities and limitations of the Firebase backend.

## Website hosting

The project is hosted by Firebase Hosting.

## Technologies
Project is created with:
* Angular: 16.2.0
* Angular CLI: 16.2.0
* Realtime Database from Firebase

## Setup

* Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
* Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Features

Unauthorised user: 
* Sign up/in
* View posts by site author and user comments on posts 

Authorised user: 
* View and comment on posts by the site author
* Edit your user data, e.g. nickname, avatar.
* Play the Snake game (choice of maps: official, users, own)
* Create your own maps
* Manage your own maps: edit, publish, delete
* Get information about your best score and the number of games played on each map

### User avatar

The user's avatar is not an image. The User creates his own avatar by choosing a colour for each element. The User's avatar is a square of 10x10 elements. 

### Snake game

The Snake game has additional features:
* Obstacles on the map
* Different types of food with unique properties, described in the project's "Guide" subpage (link to website at the bottom)

### Snake game map editor
User can:
* Name the map
* Select map size (out of 3 available)
* Choose the colour of the map, the obstacles and the snake
* Choose obstacle locations
* Select initial snake parameters (location, speed, direction)

### To do

Planned functionalities:
* Addition of a map of the day. A new map with random obstacles will be generated each day. Users will also be able to view previous maps of the day. 