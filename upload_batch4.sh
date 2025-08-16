#!/bin/bash

# Batch 4 - More matches
curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":265,"playerOnePartnerId":258,"playerTwoId":261,"playerTwoPartnerId":229,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":12}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":263,"playerOnePartnerId":229,"playerTwoId":233,"playerTwoPartnerId":237,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":10}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":265,"playerOnePartnerId":268,"playerTwoId":261,"playerTwoPartnerId":264,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":11}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":168,"playerOnePartnerId":237,"playerTwoId":258,"playerTwoPartnerId":229,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":12}],"scheduledDate":"2024-08-11"}' &

wait

echo "Batch 4 completed"