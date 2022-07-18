# Customer Service Messaging App

This application is used for sending and receiving messages between users and customer service agents in real time.

## Sending Messages

A user or an agent may send messages within the application. All valid messages sent shall be persisted in storage.

### User Send Messages

When a user sends a message, the message shall be delivered to all agents that are currently online.

### Agent Send Messages

When an agent sends a message, the agent shall send the message to a specified user, and the message shall be delivered to the said user provided the user is online. The message sent by the agent shall also be delivered to other agents.

## Receiving Messages

A user or an agent may receive messages within the application.

### User Receive Messages

- If a user is online, then the user shall receive messages sent by an agent to the said user within the application.
  
- Messages received by the user shall be arranged in ascending order of their timestamps from oldest to newest.

### Agent Receive Messages

- If an agent is online, then the agent shall receive all messages sent by users within the application.

- Messages received by the agents shall be arranged in the order of their priority and timestamp. High to low priorities, and oldest to newest timestamps respectively.

## Establishing and keeping the connection open

- When a user subscribes to receive events, the connection shall be stored on the server for as long as the user stays connected. If the user disconnects, the connection shall be removed from the server.

- When an agent subscribes to receive events, the agent's connection shall be stored on the server for as long as the agent stays connected. If the agent disconnects, the connection shall be removed from the server.

## Agent Assigment

- When an agent sends a message to a user, the system shall verify that the user is not assigned to another agent before delivering the message to the user.
  
  - If the user is assigned to another agent, the system shall reject the message.
  
  - If the user is not assigned to any agent, the system shall assign the user to the current agent and deliver the message to the user, provided the user is connected at the time.
  - If the user is already assigned to the current agent, the system shall send the message to the user.
