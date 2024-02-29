import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

export default function App() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [data, setData] = useState([]);

  const db = SQLite.openDatabase("shoppinglist.db");

  useEffect(() => {
    db.transaction(
      (transaction) => {
        transaction.executeSql(
          "create table if not exists list (id integer primary key not null, product text, amount text);"
        );
      },
      () => console.error("Error creating database"),
      updateList
    );
  }, []);

  const addItem = () => {
    db.transaction(
      (transaction) => {
        transaction.executeSql(
          "insert into list (product, amount) values (?, ?);",
          [product, amount]
        );
      },
      null,
      updateList
    );
    setProduct("");
    setAmount("");
  };

  const deleteItem = (id) => {
    db.transaction(
      (transaction) => {
        transaction.executeSql("delete from list where id = ?;", [id]);
      },
      null,
      updateList
    );
  };

  const updateList = () => {
    db.transaction(
      (transaction) => {
        transaction.executeSql("select * from list;", [], (_, { rows }) =>
          setData(rows._array)
        );
      },
      null,
      null
    );
  };

  const clearItems = () => {
    db.transaction(
      (transaction) => {
        transaction.executeSql("delete from list;");
      },
      null,
      updateList
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.fields}>
        <TextInput
          placeholder="Product"
          style={styles.input}
          onChangeText={(text) => setProduct(text)}
          value={product}
        />
        <TextInput
          placeholder="Amount"
          style={styles.input}
          onChangeText={(text) => setAmount(text)}
          value={amount}
        />
      </View>
      <View style={styles.buttons}>
        <Button title="Add" onPress={addItem} />
        <Button title="Clear" onPress={clearItems} />
      </View>
      <View style={styles.list}>
        <Text style={styles.header}>Shopping List</Text>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listitems}>
              <Text>
                {item.product}, {item.amount}{" "}
              </Text>
              <Text
                style={{ color: "#ff0000" }}
                onPress={() => deleteItem(item.id)}
              >
                Collected
              </Text>
            </View>
          )}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  fields: {
    alignItems: "center",
  },
  input: {
    width: 200,
    borderColor: "grey",
    borderWidth: 1,
  },
  buttons: {
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  header: {
    fontWeight: "bold",
    color: "blue",
  },
  list: {
    paddingTop: 10,
    alignItems: "center",
  },
  listitems: {
    flexDirection: "row",
  },
});
