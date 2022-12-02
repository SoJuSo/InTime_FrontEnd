import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useUserContext} from '../contexts/UserContext';
import {useNavigation} from '@react-navigation/native';
import {API_URL} from '@env';

const ScheduleItem = props => {
  const navigation = useNavigation();
  const {user, setUser} = useUserContext();
  const [isEnabled, setisEnabled] = useState(true);
  const [status, setStaus] = useState('PRE');
  const toggleSwitch = () => {
    setisEnabled(previousState => !previousState);
  };
  // console.log('what data came as item', props.data);
  const NAME = props.data.name;
  const date = new Date(props.data.readyTime);
  const endplace = props.data.destName;
  const startplace = props.data.sourceName;
  const endTime = new Date(props.data.endTime);

  const PUSHDATA = {
    ID: props.data.id,
    startTime: new Date(props.data.readyTime),
    endTime: new Date(props.data.endTime),
  };
  // console.log(PUSHDATA);

  const checkGroup = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/schedulePools=${props.data.schedulePoolId}/members`,
        {
          headers: {Authorization: user},
        },
      );
      console.log('SCHEDULEPOOL_SUCCESS!', res.data);
    } catch (e) {
      console.log(`[SCHEDULEPOOL_ERROR]${e}`);
    }
  };

  function print() {
    if (status === 'ING') {
      return <Text style={{color: 'black'}}>진행중</Text>;
    } else if (status === 'PRE') {
      return <Text style={{color: 'black'}}>예정</Text>;
    } else if (status === 'END') {
      return <Text style={{color: 'black'}}>종료</Text>;
    }
  }

  useEffect(() => {
    const NOW = new Date();
    const timer = date - NOW;
    const ENDTIMER = endTime - NOW;
    if (endTime <= NOW) {
      setStaus('END');
    } else if (date <= NOW) {
      setStaus('ING');
      let timeout = setTimeout(() => setStaus('END'), ENDTIMER);
      return () => {
        clearTimeout(timeout);
      };
    } else {
      let timeout = setTimeout(() => setStaus('ING'), timer);
      let timeout2 = setTimeout(() => setStaus('END'), ENDTIMER);
      return () => {
        clearTimeout(timeout);
        clearTimeout(timeout2);
      };
    }
  }, []);

  return (
    <>
      <View style={styles.item}>
        <View style={styles.itemDate}>
          <Text style={styles.itemMonthDay}>
            {date.getMonth() + 1}/{date.getDate()}
          </Text>
          <Text style={styles.itemTime}>
            {date.getHours()}:{date.getMinutes()}
          </Text>
        </View>

        <View style={styles.itemPlace}>
          {NAME && (
            <Text style={{fontWeight: 'bold', color: 'black'}}>{NAME}</Text>
          )}

          <Text style={styles.itemName}>
            {startplace}
            <Icon name={'arrow-forward'} size={10} color={'black'} />
            {endplace}
          </Text>
          <TouchableOpacity
            style={styles.friendBox}
            onPress={() =>
              navigation.push('ScheduleandMap', PUSHDATA)
            }></TouchableOpacity>
        </View>
        <View style={styles.itemDate}>
          {/* <Switch
            style={styles.toggleSwitch}
            trackColor={{false: 'grey', true: '#ED3648'}}
            thumbColor={isEnabled ? '#f4fef4' : '#f4f3f4'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          /> */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginLeft: 30,
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            {print()}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    marginTop: 20,
    background: 'white',
    padding: 15,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderColor: '#ED3648',
    borderWidth: 4,
  },
  itemDate: {
    flex: 1,
    flexDirection: 'column',
    flewWrap: 'wrap',
  },
  itemMonthDay: {
    marginLeft: 10,
    color: 'black',
  },
  itemTime: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 24,
  },
  itemPlace: {
    flex: 1,
    flexDirection: 'column',
    flewWrap: 'wrap',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  friendBox: {
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 132,
    height: 30,
    background: 'white',
    borderColor: '#ED3648',
    borderWidth: 1,
    borderRadius: 15,
  },
  toggleSwitch: {
    marginTop: 15,
  },
});
export default ScheduleItem;
