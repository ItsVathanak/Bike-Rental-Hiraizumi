import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

const API_BASE_URL = 'https://bike-rental-hiraizumi.onrender.com';

// 1. Create Auth Context
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

function ActiveRentalScreen({ route, navigation }) {
  const { rental } = route.params || {};
  const [isReturning, setReturning] = useState(false);
  const { user } = useAuth();
  const [returnStep, setReturnStep] = useState('initial');
  const [photo, setPhoto] = useState(null);
  const [rentalSession, setRentalSession] = useState(rental);

  const startReturnProcess = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rentals/start-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        const updatedRental = await response.json();
        setRentalSession(updatedRental);
        setReturnStep('lockPrompt');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to start the return process.');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setReturnStep('photoTaken');
    }
  };

  const returnBike = async () => {
    if (!user || !rentalSession?.sessionId) {
      alert('An error occurred. Missing user or session ID.');
      return;
    }
    setReturning(true);
    try {
      const formData = new FormData();
      formData.append('sessionId', rentalSession.sessionId);
      
      if (photo) {
        const uriParts = photo.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('photo', {
          uri: photo,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/rentals/return`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Bike returned successfully!');
        setPhoto(null);
        setReturnStep('initial');
        navigation.reset({
          index: 0,
          routes: [{ name: 'BikeList' }],
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to return bike: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while returning the bike.');
    } finally {
      setReturning(false);
    }
  };

  if (!rentalSession) {
    return (
      <View style={styles.container}>
        <Text>Loading rental details...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, padding: 20}}>
      <View style={{paddingBottom: 20}}>
        <Text style={styles.header}>Active Rental</Text>
        <Text style={styles.detail}>Bike: {rentalSession.bikeName}</Text>
        <Text style={styles.lockboxCode}>Lockbox Code: {rentalSession.lockboxCode}</Text>
      </View>

      {returnStep === 'initial' && (
        <Button
          title="Start Return Process"
          onPress={startReturnProcess}
        />
      )}

      {returnStep === 'lockPrompt' && (
        <View>
          <Text style={styles.detail}>Please manually lock the bike.</Text>
          <View style={{marginTop: 15}} />
          <Button
            title="Bike is Locked, Take Photo"
            onPress={() => setReturnStep('takePhoto')}
          />
        </View>
      )}

      {returnStep === 'takePhoto' && (
        <Button
          title="Take Photo of Locked Bike"
          onPress={handleTakePhoto}
        />
      )}

      {returnStep === 'photoTaken' && photo && (
        <View>
          <Text style={styles.detail}>Photo taken. Ready to submit?</Text>
          <View style={{marginTop: 15}} />
          <Button
            title={isReturning ? "Submitting..." : "Submit Return"}
            onPress={returnBike}
            disabled={isReturning}
          />
        </View>
      )}
    </View>
  );
}

function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert('Error', 'Please enter both User ID and Password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(userId, password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!userId || !password || !name || !email) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, name, email }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Registration complete! You can now log in.');
        setIsRegistering(false);
        setUserId('');
        setPassword('');
        setName('');
        setEmail('');
      } else {
        const error = await response.json();
        Alert.alert('Registration Failed', error.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bike Rental App</Text>
      <Text style={styles.header}>{isRegistering ? 'Create Account' : 'Log In'}</Text>
      
      {isRegistering && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title={isLoading ? (isRegistering ? 'Creating account...' : 'Logging in...') : (isRegistering ? 'Register' : 'Log In')}
        onPress={isRegistering ? handleRegister : handleLogin}
        disabled={isLoading}
      />
      
      <View style={{marginTop: 15}} />
      <Button
        title={isRegistering ? 'Back to Login' : 'Create New Account'}
        onPress={() => {
          setIsRegistering(!isRegistering);
          setUserId('');
          setPassword('');
          setName('');
          setEmail('');
        }}
        color="#666"
      />
    </View>
  );
}

function UserProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>User Profile</Text>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Name:</Text>
          <Text style={styles.profileValue}>{user?.name || 'N/A'}</Text>
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>User ID:</Text>
          <Text style={styles.profileValue}>{user?.id || 'N/A'}</Text>
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Email:</Text>
          <Text style={styles.profileValue}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.logoutButtonContainer}>
          <Button
            title="Sign Out"
            color="#d9534f"
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', onPress: handleLogout, style: 'destructive' }
            ])}
          />
        </View>
      </View>
    </View>
  );
}

function BikeListScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true);
  const [bikes, setBikes] = useState([]);
  const [currentRental, setCurrentRental] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => navigation.navigate('Profile')} title="Profile" color="#666" />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${user.id}`);
        const notifications = await response.json();
        if (notifications.length > 0) {
          const message = notifications.map(n => n.message).join('\n');
          Alert.alert('Notification', message);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const getActiveBikesAndRental = async () => {
    try {
      const [bikesResponse, activeRentalResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/bikes`),
        fetch(`${API_BASE_URL}/rentals/active/${user.id}`),
      ]);
      const bikesJson = await bikesResponse.json();
      const activeRentalJson = await activeRentalResponse.json();
      
      setBikes(bikesJson);
      setCurrentRental(activeRentalJson);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        getActiveBikesAndRental();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      {isLoading ? (
        <ActivityIndicator/>
      ) : (
        <FlatList
          data={bikes}
          keyExtractor={({ id }) => id.toString()}
          ListHeaderComponent={() =>
            currentRental ? (
              <View style={styles.activeRentalBanner}>
                <Text style={styles.activeRentalTitle}>Active Rental</Text>
                <Text style={styles.activeRentalText}>Bike: {currentRental.bikeName}</Text>
                <Text style={styles.activeRentalText}>Status: {currentRental.rentalStatus}</Text>
                <TouchableOpacity
                  style={styles.continueRentalButton}
                  onPress={() => navigation.navigate('ActiveRental', { rental: currentRental })}
                >
                  <Text style={styles.continueRentalButtonText}>Continue Rental</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.bikeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bikeName}>{item.name}</Text>
              </View>
              {item.status === 'available' ? (
                <TouchableOpacity
                  style={[styles.rentButtonGreen, currentRental && styles.rentButtonDisabled]}
                  onPress={() => navigation.navigate('Rental', { bike: item })}
                  disabled={!!currentRental}
                >
                  <Text style={styles.rentButtonTextGreen}>Rent</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.inUseButtonRed} disabled>
                  <Text style={styles.inUseButtonText}>In Use</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

function RentalScreen({ route, navigation }) {
  const { bike } = route.params || {};
  const [isRenting, setRenting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();

  const rentBike = async () => {
    if (!bike?.id) return;
    setShowPaymentModal(true);
  };

  const proceedWithRental = async () => {
    if (!user) {
      alert('You must be logged in to rent a bike.');
      setShowPaymentModal(false);
      return;
    }
    setRenting(true);
    setShowPaymentModal(false);
    try {
      const response = await fetch(`${API_BASE_URL}/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bikeId: bike.id,
          userId: user.id,
        }),
      });
      if (response.ok) {
        const newRental = await response.json();
        alert('Bike rented successfully! Please pay at the designated payment box.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'ActiveRental', params: { rental: { ...newRental, bikeName: bike.name } } }],
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to rent bike: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while renting the bike.');
    } finally {
      setRenting(false);
    }
  };

  const cancelPayment = () => {
    setShowPaymentModal(false);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{fontSize: 20, marginBottom: 20, fontWeight: 'bold'}}>Confirm Rental</Text>
      
      {bike && (
        <View style={styles.bikeDetailsContainer}>
          <View style={styles.bikeDetailRow}>
            <Text style={styles.bikeDetailLabel}>Bike ID:</Text>
            <Text style={styles.bikeDetailValue}>{bike.id}</Text>
          </View>
          <View style={styles.bikeDetailRow}>
            <Text style={styles.bikeDetailLabel}>Bike Name:</Text>
            <Text style={styles.bikeDetailValue}>{bike.name}</Text>
          </View>
          <View style={styles.bikeDetailRow}>
            <Text style={styles.bikeDetailLabel}>Bike Type:</Text>
            <Text style={styles.bikeDetailValue}>{bike.bikeType === 'electric' ? 'Electric' : 'Non-Electric'}</Text>
          </View>
          <View style={styles.bikeDetailRow}>
            <Text style={styles.bikeDetailLabel}>Price:</Text>
            {/* Change below to Yen or Dollar */}
            <Text style={styles.bikeDetailValue}>¥{bike.price}</Text>
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.confirmButton, isRenting && styles.confirmButtonDisabled]}
        onPress={rentBike}
        disabled={isRenting || !bike}
      >
        <Text style={styles.confirmButtonText}>
          {isRenting ? "Renting..." : "Confirm Rent"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelPayment}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Confirm Payment</Text>
            
            <Text style={styles.paymentModalText}>
              Bike: {bike?.name}
            </Text>
            <Text style={styles.paymentModalText}>
              Type: {bike?.bikeType === 'electric' ? 'Electric' : 'Non-Electric'}
            </Text>
            <Text style={styles.paymentModalText}>
              Rental cost: ¥{bike?.price}
            </Text>
            
            <Text style={styles.paymentInstructions}>
              Please pay at the designated payment box:
            </Text>
            
            <Image
              source={require('./assets/payment_box.jpg')}
              style={styles.paymentBoxImage}
              resizeMode="contain"
            />
            
            <View style={styles.paymentModalButtonContainer}>
              <TouchableOpacity
                style={styles.paymentConfirmButton}
                onPress={proceedWithRental}
                disabled={isRenting}
              >
                <Text style={styles.paymentConfirmButtonText}>
                  {isRenting ? "Processing..." : "Continue"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.paymentCancelButton}
                onPress={cancelPayment}
                disabled={isRenting}
              >
                <Text style={styles.paymentCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (userId, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const userData = await response.json();
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

function AppNavigator() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const bootstrapAsync = async () => {
      let storedUser = null;
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          storedUser = JSON.parse(userString);
          setUser(storedUser);
        }
      } catch (e) {
        console.log('Failed to restore session');
      }

      if (storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/rentals/active/${storedUser.id}`);
          const activeRental = await response.json();
          if (activeRental) {
            setInitialRoute({ name: 'ActiveRental', params: { rental: activeRental } });
          } else {
            setInitialRoute({ name: 'BikeList' });
          }
        } catch (e) {
          console.error("Failed to check for active rental", e);
          setInitialRoute({ name: 'BikeList' });
        }
      } else {
        setInitialRoute({ name: 'Login' });
      }

      setIsLoading(false);
    };

    if (user) {
      const checkForActiveRental = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/rentals/active/${user.id}`);
          const activeRental = await response.json();
          if (activeRental) {
            setInitialRoute({ name: 'ActiveRental', params: { rental: activeRental } });
          } else {
            setInitialRoute({ name: 'BikeList' });
          }
        } catch (e) {
          console.error("Failed to check for active rental", e);
          setInitialRoute({ name: 'BikeList' });
        } finally {
          setIsLoading(false);
        }
      };
      checkForActiveRental();
    } else {
      bootstrapAsync();
    }
  }, [user, setUser]);

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="BikeList" component={BikeListScreen} options={{ title: 'Available Bikes' }}/>
            <Stack.Screen name="Profile" component={UserProfileScreen} options={{ title: 'Profile' }}/>
            <Stack.Screen name="Rental" component={RentalScreen} />
            <Stack.Screen name="ActiveRental" component={ActiveRentalScreen} options={{ title: 'Your Rental' }}/>
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bikeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  rentButtonGreen: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  rentButtonTextGreen: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rentButtonDisabled: {
    opacity: 0.5,
  },
  inUseButtonRed: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    opacity: 0.6,
  },
  inUseButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeRentalBanner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  activeRentalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  activeRentalText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  continueRentalButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  continueRentalButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  bikeDetailsContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  bikeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bikeDetailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  bikeDetailValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paymentModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  paymentModalText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  paymentInstructions: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  paymentBoxImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  paymentModalButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  paymentConfirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
  },
  paymentConfirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  paymentCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  paymentCancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    position: 'absolute',
    top: 150,
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
  },
  lockboxCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingLeft: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  profileRow: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  profileValue: {
    fontSize: 16,
    color: '#333',
  },
  logoutButtonContainer: {
    marginTop: 20,
  },
});
