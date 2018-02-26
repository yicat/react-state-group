import MessageQueue from "../src/message-queue";

const listenerA1 = done => {
  return "A1";
};

const listenerA2 = done => {
  return "A2";
};

const listenerB = done => {
  return "B";
};

test("Test addListenr & removeListener", () => {
  const mq = new MessageQueue();
  mq.addListener("A", listenerA1);
  mq.addListener("A", listenerA2);
  mq.addListener("B", listenerB);

  mq.emit("A");
});
