import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import { ref, onValue, set, remove } from "firebase/database";
import { db, auth } from "../Firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const userId = auth.currentUser?.uid;
  const screenWidth = Dimensions.get("window").width;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Your Cart",
      headerLeft: () => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerLeftButton}
        >
          <Text style={styles.headerLeftText}>Back</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={() => {
          }}
        >
          <Text style={styles.headerButtonText}>Checkout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!userId) return;

    const cartRef = ref(db, `carts/${userId}`);

    const unsubscribe = onValue(cartRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const items = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setCartItems(items);

      try {
        await AsyncStorage.setItem(`@cart_${userId}`, JSON.stringify(items));
      } catch (e) {
        console.log("Failed to save cart locally", e);
      }
    });

    const loadCart = async () => {
      try {
        const saved = await AsyncStorage.getItem(`@cart_${userId}`);
        if (saved) setCartItems(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load cart from local storage", e);
      }
    };
    loadCart();

    return () => unsubscribe();
  }, [userId]);

  const updateQuantity = async (item, qty) => {
    if (!userId) return;
    const itemRef = ref(db, `carts/${userId}/${item.id}`);
    if (qty <= 0) {
      remove(itemRef);
    } else {
      await set(itemRef, { ...item, quantity: qty });
    }
  };

  const total = cartItems.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image
                source={{ uri: item.image }}
                style={[
                  styles.image,
                  { width: screenWidth * 0.2, height: screenWidth * 0.2 },
                ]}
                resizeMode="contain"
              />
              <View style={styles.itemBody}>
                <Text numberOfLines={2} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.itemPrice}>${item.price}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.qtyBtn}
                    onPress={() =>
                      updateQuantity(item, (item.quantity || 1) - 1)
                    }
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.qtyInput}
                    value={String(item.quantity || 1)}
                    keyboardType="numeric"
                    onChangeText={(v) => {
                      const n = Number(v) || 0;
                      updateQuantity(item, n);
                    }}
                  />

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.qtyBtn}
                    onPress={() =>
                      updateQuantity(item, (item.quantity || 0) + 1)
                    }
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.removeBtn}
                    onPress={() => remove(ref(db, `carts/${userId}/${item.id}`))}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkout} activeOpacity={0.8}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#222" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  image: { marginRight: 12 },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#222" },
  itemPrice: { color: "#1E90FF", marginTop: 6, fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  qtyBtn: {
    backgroundColor: "#1E90FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qtyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  qtyInput: {
    width: 48,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 6,
  },
  removeBtn: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 6 },
  removeText: { color: "#888" },
  footer: { marginTop: "auto", alignItems: "center", paddingVertical: 12 },
  total: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 8 },
  checkout: {
    backgroundColor: "#1E90FF",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#777" },
  headerButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#1E90FF",
    borderRadius: 6,
  },
  headerButtonText: { color: "#fff", fontWeight: "600" },
  headerLeftButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "transparent",
    borderRadius: 6,
  },
  headerLeftText: { color: "#1E90FF", fontWeight: "600" },
});
