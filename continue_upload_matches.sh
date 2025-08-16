#!/bin/bash

# Continue uploading remaining matches (batch 3)
curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":261,"playerOnePartnerId":258,"playerTwoId":168,"playerTwoPartnerId":229,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":13}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":258,"playerOnePartnerId":264,"playerTwoId":235,"playerTwoPartnerId":233,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":11,"playerTwoScore":15}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":263,"playerOnePartnerId":268,"playerTwoId":168,"playerTwoPartnerId":229,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":7}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":233,"playerOnePartnerId":262,"playerTwoId":235,"playerTwoPartnerId":237,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":8}],"scheduledDate":"2024-08-11"}' &

wait

echo "Batch 3 completed"