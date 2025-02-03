const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrarr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const campaignCollection = client.db('campaignDB').collection('campaign');
    const userCollection = client.db('campaignDB').collection('users');
    const donationCollection = client.db('campaignDB').collection('donations');

    app.get('/campaign', async (req, res) => {
      const cursor = campaignCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/campaign/:params', async (req, res) => {
      try {
        const param = req.params.params;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);
        if (isObjectId) {
          const query = { _id: new ObjectId(param) };
          const result = await campaignCollection.findOne(query);
          res.send(result);
        } else {
          const query = { email: param };
          const cursor = campaignCollection.find(query);
          const result = await cursor.toArray();
          res.send(result);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).send({ message: 'Failed to fetch campaigns' });
      }
    });


    app.get('/runningCampaign', async (req, res) => {
      try {
        const cursor = campaignCollection.find().limit(6);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).send({ message: 'Failed to fetch campaigns' });
      }
    });


    app.post('/campaign', async (req, res) => {
      const newCampaign = req.body;
      console.log(newCampaign);
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    })

    app.put('/campaign/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: updatedData };

      try {
        const result = await campaignCollection.updateOne(query, update);
        if (result.modifiedCount > 0) {
          res.status(200).send({ message: "Campaign updated successfully." });
        } else {
          res.status(404).send({ message: "Campaign not found or no changes made." });
        }
      } catch (error) {
        console.error("Error updating campaign:", error);
        res.status(500).send({ message: "Internal server error." });
      }

    })

    app.delete('/campaign/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await campaignCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send({ message: 'Campaign deleted successfully' });
        } else {
          res.status(404).send({ message: 'Campaign not found' });
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).send({ message: 'Failed to delete campaign' });
      }
    });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Users API

    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log('Creating New User', newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })
    // donations API

    app.get('/donations/:email', async (req, res) => {
      const email = req.params.email;
      const cursor = donationCollection.find({email: email});
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/donations', async (req, res) => {
      const newDonation = req.body;
      console.log('New Donation', newDonation);
      const result = await donationCollection.insertOne(newDonation);
      res.send(result);
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Funding server is running');
})


app.listen(port, () => {
  console.log(`Funding Server is running on Port ${port}`)
})
