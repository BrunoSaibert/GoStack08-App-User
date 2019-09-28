import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmintButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  ErrorMessage,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
    error: false,
    errorMessage: '',
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;
    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handeAddUser = async () => {
    const { newUser, users } = this.state;

    this.setState({ loading: true, error: false });

    try {
      if (newUser.length === 0) {
        throw new Error('Informe um usuário.');
      }

      const response = await api.get(`/users/${newUser}`).catch(() => {
        throw new Error('Usuário não existe');
      });

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      this.setState({
        users: [...users, data],
        newUser: '',
        loading: false,
      });
    } catch (error) {
      this.setState({
        error: true,
        errorMessage: `${error}`,
      });
    } finally {
      this.setState({
        loading: false,
      });

      Keyboard.dismiss();
    }
  };

  handleFocus = () => {
    this.setState({ error: false });
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    this.setState({ newUser: '', error: false });

    navigation.navigate('User', { user });
  };

  render() {
    const { newUser, users, loading, error, errorMessage } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handeAddUser}
            error={error}
            onFocus={this.handleFocus}
          />
          <SubmintButton loading={loading} onPress={this.handeAddUser}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="add" size={20} color="#fff" />
            )}
          </SubmintButton>
        </Form>

        {error && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
