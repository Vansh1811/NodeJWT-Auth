const express = require('express'); 

const app = express();
const port = 3000;
app.use(express.json());
const auth = require('./route/auth');

app.use('/auth', auth);
app.listen(port, (err)=> {

    if (err)  console.error("Error starting the server:", err);
    else
   console.log(`Server running on http://localhost:${port}`);

}   );


//basically boiler code maan lo isse 
