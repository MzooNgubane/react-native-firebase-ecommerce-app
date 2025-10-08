import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { ref, set, get } from "firebase/database";
import { db, auth } from "../Firebase";

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const screenWidth = Dimensions.get("window").width;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Product Details",
      headerLeft: () => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerLeftButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerLeftText}>Back</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.headerButtonText}>Cart</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddToCart = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return alert("You must be logged in to add items to cart");

    const itemRef = ref(db, `carts/${userId}/${product.id}`);

    try {
      const snapshot = await get(itemRef);
      const existing = snapshot.val();
      const quantity = existing ? existing.quantity + 1 : 1;

      await set(itemRef, {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity,
      });

      alert("Added to cart!");
    } catch (error) {
      console.log(error);
      alert("Failed to add to cart.");
    }
  };

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <Image
      source={{ uri: product.image }}
      style={[styles.image, { width: screenWidth * 0.7, height: screenWidth * 0.7 }]}
      resizeMode="contain"
    />
    <Text style={styles.title}>{product.title}</Text>
    <Text style={styles.price}>${product.price}</Text>
    <Text style={styles.desc}>{product.description}</Text>

    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cta}
      onPress={handleAddToCart}
    >
      <Text style={styles.ctaText}>Add to Cart</Text>
    </TouchableOpacity>
  </ScrollView>
);
;
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center", backgroundColor: "#fff" },
  image: { marginBottom: 20 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#222",
  },
  price: {
    fontSize: 18,
    color: "#1E90FF", 
    marginBottom: 12,
    fontWeight: "700",
  },
  desc: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
    paddingHorizontal: 8,
  },
  cta: {
    backgroundColor: "#1E90FF", 
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
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

  inScreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inScreenBack: { paddingHorizontal: 6, paddingVertical: 4 },
  inScreenBackText: { color: "#1E90FF", fontWeight: "600", fontSize: 16 }, 
  inScreenTitle: { fontSize: 18, fontWeight: "700", color: "#222" },
});
