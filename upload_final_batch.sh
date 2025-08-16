#!/bin/bash

# Final batch - remaining 15 matches
curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":233,"playerOnePartnerId":265,"playerTwoId":263,"playerTwoPartnerId":261,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":7,"playerTwoScore":15}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":262,"playerOnePartnerId":268,"playerTwoId":235,"playerTwoPartnerId":264,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":13}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":264,"playerOnePartnerId":265,"playerTwoId":258,"playerTwoPartnerId":261,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":11}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":237,"playerOnePartnerId":262,"playerTwoId":168,"playerTwoPartnerId":233,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":9,"playerTwoScore":15}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":258,"playerOnePartnerId":168,"playerTwoId":263,"playerTwoPartnerId":229,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":12}],"scheduledDate":"2024-08-11"}' &

wait

echo "Match batch 1 of final set completed"

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":263,"playerOnePartnerId":265,"playerTwoId":237,"playerTwoPartnerId":264,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":14}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":261,"playerOnePartnerId":237,"playerTwoId":235,"playerTwoPartnerId":268,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":6}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":233,"playerOnePartnerId":264,"playerTwoId":229,"playerTwoPartnerId":262,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":11}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":263,"playerOnePartnerId":262,"playerTwoId":168,"playerTwoPartnerId":265,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":13}],"scheduledDate":"2024-08-11"}' &

curl -X POST http://localhost:5000/api/matches -H "Content-Type: application/json" -H "Cookie: pickle_session_id=s%3AIgW1b_MhCQH4vmqEE46DLAMsJU1MBwRI.sM13UI2HmZUEWeYpyPbXXFxpxHv%2FOFPmbGnLCjDkPxo" -d '{"playerOneId":258,"playerOnePartnerId":237,"playerTwoId":261,"playerTwoPartnerId":268,"matchType":"doubles","formatType":"standard","games":[{"playerOneScore":15,"playerTwoScore":10}],"scheduledDate":"2024-08-11"}' &

wait

echo "All matches uploaded successfully!"