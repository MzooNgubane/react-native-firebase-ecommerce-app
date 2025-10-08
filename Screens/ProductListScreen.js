import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { auth } from "../Firebase";

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("Login"); 
    } catch (error) {
      console.log(error);
      alert("Failed to logout.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "ShopEZ Products",
      headerLeft: () => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerLeftButton}
          onPress={handleLogout}
        >
          <Text style={styles.headerLeftText}>Logout</Text>
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

  const fetchProducts = async (category = null) => {
    setLoading(true);
    try {
      const url = category
        ? `https://fakestoreapi.com/products/category/${category}`
        : `https://fakestoreapi.com/products`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "https://fakestoreapi.com/products/categories"
      );
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.pageTitle}>ShopEZ Products</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.activeCategory,
            ]}
            onPress={() => {
              setSelectedCategory(cat);
              fetchProducts(cat);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.categoryButton, !selectedCategory && styles.activeCategory]}
          onPress={() => {
            setSelectedCategory(null);
            fetchProducts();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.categoryText}>All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
        ListHeaderComponent={renderListHeader}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          >
            <Image
              source={{ uri: item.image }}
              style={[
                styles.image,
                { width: screenWidth * 0.18, height: screenWidth * 0.18 },
              ]}
              resizeMode="contain"
            />
            <View style={styles.cardBody}>
              <Text numberOfLines={2} style={styles.title}>
                {item.title}
              </Text>
              <Text style={styles.price}>${item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f7f7" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  image: { marginRight: 12 },
  cardBody: { flex: 1 },
  title: { fontWeight: "600", fontSize: 14, color: "#222" },
  price: { color: "#1E90FF", marginTop: 6, fontWeight: "700" }, 
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  listHeader: {
    backgroundColor: "#f7f7f7",
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  pageTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 8 },
  categoryScroll: { alignItems: "center" },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 8,
  },
  activeCategory: { backgroundColor: "#1E90FF" }, 
  categoryText: { textTransform: "capitalize", color: "#000" },

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
