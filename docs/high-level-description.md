# Customer Service Messaging App

This application is used for sending and receiving messages between users and customer service agents in real time.

## Sending Messages

A user or an agent may send messages within the application.

### User Send Messages

When a user sends a message, the message shall be delivered to all agents that are currently online.

### Agent Send Messages

When an agent sends a message, the agent shall send the message to a specified user, and the message shall be delivered to the said user provided the user is online.

## Receiving Messages

A user or an agent may receive messages with the application.

### User Receive Messages

- If a user is online, then the user shall receive messages sent by an agent to the said user within the application.
  
- Messages received by the user shall be arranged in ascending order of their timestamps from oldest to newest.

### Agent Receive Messages

- If an agent is online, then the agent shall receive all messages sent by users within the application.

- Messages received by the agents shall be arranged in the order of their priority and timestamp. High to low priorities, and oldest to newest timestamps respectively.
