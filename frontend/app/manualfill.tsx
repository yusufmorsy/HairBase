import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

// Example TypeScript interface for the product
interface Product {
  _id?: string;
  name: string;
  brand: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  subCategory: string;
  price: number;
  images: string[];
  benefits: string[];
  concerns: string[];
}

const ManualFill: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    name: '',
    brand: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    subCategory: '',
    price: 0,
    images: [],
    benefits: [],
    concerns: [],
  });

  // Handle form submission
  const handleSubmit = () => {
    console.log('Product form data:', product);

    // TODO: Add logic here to save your product data to the backend
    // For example, using fetch, axios, or any other library.
  };

  // Example of how to update LLM-generated fields (on a button press)
  const handleGenerateLLMFields = async () => {
    try {
      // e.g., call a special route or function that returns arrays of benefits/concerns
      const generatedData = {
        benefits: ['Example Benefit 1', 'Example Benefit 2'],
        concerns: ['Example Concern 1'],
      };

      setProduct((prev) => ({
        ...prev,
        benefits: generatedData.benefits,
        concerns: generatedData.concerns,
      }));
    } catch (error) {
      console.error('Error generating LLM fields:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Manual Product Fill</Text>

      {/* Product Name */}
      <Text style={styles.label}>Product Name</Text>
      <TextInput
        style={styles.input}
        value={product.name}
        onChangeText={(text) => setProduct({ ...product, name: text })}
      />

      {/* Brand */}
      <Text style={styles.label}>Brand</Text>
      <TextInput
        style={styles.input}
        value={product.brand}
        onChangeText={(text) => setProduct({ ...product, brand: text })}
      />

      {/* Short Description */}
      <Text style={styles.label}>Short Description</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        multiline
        value={product.shortDescription}
        onChangeText={(text) =>
          setProduct({ ...product, shortDescription: text })
        }
      />

      {/* Long Description */}
      <Text style={styles.label}>Long Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={product.longDescription}
        onChangeText={(text) =>
          setProduct({ ...product, longDescription: text })
        }
      />

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={product.category}
        onChangeText={(text) => setProduct({ ...product, category: text })}
      />

      {/* Sub-Category */}
      <Text style={styles.label}>Sub-Category</Text>
      <TextInput
        style={styles.input}
        value={product.subCategory}
        onChangeText={(text) => setProduct({ ...product, subCategory: text })}
      />

      {/* Price */}
      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(product.price)}
        onChangeText={(text) =>
          setProduct({
            ...product,
            price: parseFloat(text) || 0,
          })
        }
      />

      {/* Images (comma-separated URLs) */}
      <Text style={styles.label}>Images (comma-separated URLs)</Text>
      <TextInput
        style={styles.input}
        value={product.images.join(', ')}
        onChangeText={(text) =>
          setProduct({ ...product, images: text.split(',') })
        }
      />

      {/* Benefits (newline-separated) */}
      <Text style={styles.label}>Benefits</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        multiline
        value={product.benefits.join('\n')}
        onChangeText={(text) =>
          setProduct({ ...product, benefits: text.split('\n') })
        }
      />

      {/* Concerns (newline-separated) */}
      <Text style={styles.label}>Concerns</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        multiline
        value={product.concerns.join('\n')}
        onChangeText={(text) =>
          setProduct({ ...product, concerns: text.split('\n') })
        }
      />

      <Button title="Save Product" onPress={handleSubmit} />

      <View style={{ marginVertical: 10 }} />

      <Button title="Auto-Generate Benefits & Concerns" onPress={handleGenerateLLMFields} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
});

export default ManualFill;
