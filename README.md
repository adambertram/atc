# ATC - Top Trips Web App
<b>Info: </b>
This map shows the most frequented pick ups for the NYC area from 4/1/2014-9/30/2014.  To interact, simply draw a shape around the markers and you will be presented with information related to these markers, such as total amount of pickups for the area and the top 10 pickup locations.  To remove the shape and reset the map, clicking anywhere will delete your drawn shape and un-hide the markers outside of the area.  You can also switch to the draw tool again and draw another shape.  You can also show/hide a heatmap layer that will show you the correlated data, within your drawn shape or as an overall of the map (if no shape is present).

<b>How To Run:</b>
To run, you need to have Python 3.x installed, as well as the Flask API framework with the following modules:
<ul>
<li>flask_restful</li>
<li>flaskext.mysql</li>
<li>flask_cors </li>
</ul>

Then with flask, navigate to the directory containing the py file and run <code>export FLASK_APP=trips_api.py</code>, followed by <code>flask run --host=0.0.0.0</code> which will make the api available to any outside source.

<b>Approach:</b>
With the amount of data presented with the data set, I wanted to make an actual useful representation instead of just putting all of the trips on the map.  It was simply too much data to take in and I thought doing a top trips would be a better use of the data.  Once I went with this approach, the map was much less cluttered and could be read easily.  

<b>Design:</b>
The design is very straight forward, with the map being the main focal point.  There is a toolbar across the top that can easily be extended to add more filtering options.  When a selection is made, an overlay appears showing the top pickup information.

<b>More Time:</b>
If I had more time, I would of have liked to of added a top route and top drop-off filter as well.  I had a working solution for the routes but with all of the lines going through the map, it was too much information to be of any use.

<b>http://atc.adambertram.net</b>
