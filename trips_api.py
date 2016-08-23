import datetime
from flask import Flask
from flask_restful import Resource, Api
from flask_restful import reqparse
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin



mysql = MySQL()
app = Flask(__name__)
cors = CORS(app)

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'cf_atc'
app.config['MYSQL_DATABASE_PASSWORD'] = 'MA815O'
app.config['MYSQL_DATABASE_DB'] = 'atc'
app.config['MYSQL_DATABASE_HOST'] = 'mysql.blackfishdev.com'


mysql.init_app(app)

api = Api(app)

class GetTripsTop(Resource):
    def post(self):
        try: 
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('startdate', type=str)
            parser.add_argument('enddate', type=str)
            args = parser.parse_args()

            _startdate = args['startdate']
            _enddate = args['enddate']

            conn = mysql.connect()
            cursor = conn.cursor()
            query = ("SELECT distinct(a.coords), count(a.id) as c from( "
                "SELECT concat(lat , ', ', lon) as coords, id from trips "
                "WHERE date(date) between %s AND %s"
            ")a "
            "group by a.coords "
            "having count(a.id) > 50 "
            "order by c desc "
            "limit 500")
           

            cursor.execute(query, (_startdate, _enddate))

            data = cursor.fetchall()

            items_list=[];
            for item in data:
                i = {
                    'coords':item[0],
                    'count':item[1]
                }
                items_list.append(i)

            return {'StatusCode':'200','Items':items_list,'Item Count':len(items_list)}

        except Exception as e:
            return {'error': str(e)}

api.add_resource(GetTripsTop, '/tripstop')

if __name__ == '__main__':
    app.run(debug=True)