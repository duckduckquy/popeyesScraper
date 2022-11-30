const axios = require('axios');
const ObjectsToCsv = require('objects-to-csv');

const states = require('./constants');

function getPopeyesLocations(){
    const promises = []
    for( let i = 0; i < states.length; i++){

        const state = states[i]
        const { latitude : lat, longitude : lon } = state

        var data = JSON.stringify([
            {
              "operationName": "GetRestaurants",
              "variables": {
                "input": {
                  "filter": "NEARBY",
                  "coordinates": {
                    "userLat": lat,
                    "userLng": lon,
                    "searchRadius": 800000 
                  },
                  "first": 10000, 
                  "status": "OPEN"
                }
              },
              "query": "query GetRestaurants($input: RestaurantsInput) {\n  restaurants(input: $input) {\n    pageInfo {\n      hasNextPage\n      endCursor\n      __typename\n    }\n    totalCount\n    nodes {\n      ...RestaurantNodeFragment\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment RestaurantNodeFragment on RestaurantNode {\n  _id\n  storeId\n  isAvailable\n  posVendor\n  chaseMerchantId\n  curbsideHours {\n    ...OperatingHoursFragment\n    __typename\n  }\n  deliveryHours {\n    ...OperatingHoursFragment\n    __typename\n  }\n  diningRoomHours {\n    ...OperatingHoursFragment\n    __typename\n  }\n  distanceInMiles\n  drinkStationType\n  driveThruHours {\n    ...OperatingHoursFragment\n    __typename\n  }\n  driveThruLaneType\n  email\n  environment\n  franchiseGroupId\n  franchiseGroupName\n  frontCounterClosed\n  hasBreakfast\n  hasBurgersForBreakfast\n  hasCatering\n  hasCurbside\n  hasDelivery\n  hasDineIn\n  hasDriveThru\n  hasTableService\n  hasMobileOrdering\n  hasLateNightMenu\n  hasParking\n  hasPlayground\n  hasTakeOut\n  hasWifi\n  hasLoyalty\n  id\n  isDarkKitchen\n  isFavorite\n  isHalal\n  isRecent\n  latitude\n  longitude\n  mobileOrderingStatus\n  name\n  number\n  parkingType\n  phoneNumber\n  physicalAddress {\n    address1\n    address2\n    city\n    country\n    postalCode\n    stateProvince\n    stateProvinceShort\n    __typename\n  }\n  playgroundType\n  pos {\n    vendor\n    __typename\n  }\n  posRestaurantId\n  restaurantImage {\n    asset {\n      _id\n      metadata {\n        lqip\n        palette {\n          dominant {\n            background\n            foreground\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    crop {\n      top\n      bottom\n      left\n      right\n      __typename\n    }\n    hotspot {\n      height\n      width\n      x\n      y\n      __typename\n    }\n    __typename\n  }\n  restaurantPosData {\n    _id\n    __typename\n  }\n  status\n  vatNumber\n  __typename\n}\n\nfragment OperatingHoursFragment on OperatingHours {\n  friClose\n  friOpen\n  monClose\n  monOpen\n  satClose\n  satOpen\n  sunClose\n  sunOpen\n  thrClose\n  thrOpen\n  tueClose\n  tueOpen\n  wedClose\n  wedOpen\n  __typename\n}\n"
            }
          ]);

          var config = {
            method: 'post',
            url: 'https://use1-prod-plk.rbictg.com/graphql',
            headers: { 
              'authority': 'use1-prod-plk.rbictg.com', 
              'accept': '*/*', 
              'accept-language': 'en-US,en;q=0.9', 
              'apollographql-client-name': 'wl-web', 
              'apollographql-client-version': '4ef9144', 
              'content-type': 'application/json', 
              'origin': 'https://www.popeyes.com', 
              'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"', 
              'sec-ch-ua-mobile': '?0', 
              'sec-ch-ua-platform': '"macOS"', 
              'sec-fetch-dest': 'empty', 
              'sec-fetch-mode': 'cors', 
              'sec-fetch-site': 'cross-site', 
              'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36', 
              'x-forter-token': '4798c310640a4c129119b405583aca62_1669841988907__UDF43_13ck_tt', 
              'x-session-id': '4C6B1EAF-0D2A-4295-84FB-81CDCDFC25D2', 
              'x-ui-language': 'en', 
              'x-ui-platform': 'web', 
              'x-ui-region': 'US', 
              'x-user-datetime': '2022-11-30T16:00:05-05:00'
            },
            data : data
          }; 

        promises.push(axios(config))
    }

    Promise.allSettled(promises).then((res) => {

        const popeyes = []
        for( let i = 0; i < res.length; i++){
            const nodes = res[i].value.data[0].data?.restaurants?.nodes
            const restaurants = nodes.map(node => {
                return {
                    id : node?.id, name : 'Popeyes ' + node?.name, lat : node?.latitude, lon : node?.longitude
                }
            })
            restaurants.forEach(restaurant => {
                const isInArray = popeyes.find(fRestaurant => fRestaurant.id === restaurant.id )
                if( !isInArray){
                    popeyes.push(restaurant)
                }
            })
        }
        const csv = new ObjectsToCsv(popeyes);
        csv.toDisk('./Popeyes_Store_Locations.csv'); 
    })

}

getPopeyesLocations();
