Overall goal: create an active and online storage for a fictional low fantasy setting, carrying details about the world, about its people, its places, and so forth.



Specifics:

* Interactive regional map, where the user can navigate through and select cities, towns, and villages to learn more, or open up the specific maps for those places.
* Navigable family trees, showing descendants.
* Works seamlessly on desktop and varying mobile devices.
* Contains user accounts that can make posts only visible to themselves, to act as personal campaign notes. Can be left on any non-home page.
* Create a clean and effective database with solid design that stores user account information and notes left upon non-home pages.
* Low fantasy visual styling with accessible visuals, setups, and layouts.
* Highly responsive interface using smooth animations.
* Toggleable dark and light modes.



More or less just a glorified blog that is easy to update, customize, and so forth.



For family trees, try React Flow. Use purely interactive SVGs for custom maps.



**Entities**



Region

Geography of Interest

City

Town

Village

Points of Interest

Character

Family

User

UserNote



**Entity Relationships**



* A region can have multiple geographies of interest, but a geography of interest only belongs to one region.
* A region can have multiple cities, but a city belongs to only one region
* A region can have multiple towns, but a town belongs to only one region.
* A region can have multiple village, but a village belongs to only one region.
* A region can have multiple points of interest, but a point of interest belongs to only one town.
* A city can have multiple points of interest, but a point of interest belongs to only one city.
* A town can have multiple points of interest, but a point of interest belongs to only one town.
* A village can have multiple points of interest, but a point of interest belongs to only one village.
* A family can have many characters and a character can be attached to multiple families.
* A user can have many UserNotes, but a UserNote belongs only to one user.

