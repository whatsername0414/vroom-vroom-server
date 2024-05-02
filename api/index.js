import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import auth from './routes/auth.js';
import users from './routes/users.js';
import orders from './routes/orders.js';
import payments from './routes/payments.js';
import merchants from './routes/merchants.js';
import categories from './routes/categories.js';
import upload from './routes/upload.js';
import socket from './routes/socket.js';
import request from 'request';

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
const connect = async () => {
  try {
    mongoose.connect(process.env.MONGODB);
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
});

app.set('socket', io);
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/orders', orders);
app.use('/api/v1/payments', payments);
app.use('/api/v1/merchants', merchants);
app.use('/api/v1/categories', categories);
app.use('/api/v1/upload', upload);
app.use('/public/images', express.static('public/images'));
app.use('/api/v1/socket', socket);
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || 'Something went wrong';
  return res.status(errorStatus).json({
    c: errorStatus,
    m: errorMessage,
    s: err.stack || null,
  });
});

app.use('/callback', function (req, res) {
  var auth =
    'Basic ' +
    new Buffer.from(
      '9f8b9f18be244d00a1179d4c27289f96' +
        ':' +
        'f091d5e08ff34b428487b63787e0b265'
    ).toString('base64');
  console.log(auth);
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: 'AQA9hzQaeezHam0jSlcTWRQYUCXojggxN_8L8K-eRNH6j-1rk459IoCHT7-h8UyjjptPFNMbxD0ruTWiiaRBivPDteZzAxYusjHwadEHTz2tuYHx_01AO1bhJzPqTyP_QvrvOOZfinhkKjxKRxs_VQcp3zgYADYSHk7Q',
      redirect_uri: 'http://192.168.1.9/3000',
      grant_type: 'authorization_code',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: auth,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    console.log(body);
    if (!error && response.statusCode === 200) {
      var accessToken = body.access_token;
      var refreshToken = body.refresh_token;
      res.send(
        'Access Token: ' + accessToken + '<br>Refresh Token: ' + refreshToken
      );
    } else {
      res.status(response.statusCode).send(body);
    }
  });
});

server.listen(port, () => {
  connect();
  console.log(`Connected to port: ${port}`);
});
