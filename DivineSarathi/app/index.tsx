import { Redirect } from "expo-router";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useEffect } from 'react';
import { checkAuth } from '../redux/auth/slice';

export default function Index() {
    const { authenticated, loading, hasCompletedLanguageSelection } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
      // @ts-ignore
      dispatch(checkAuth());
    }, [dispatch]);

    if (loading) return null; // or a loading spinner
    
    // Route based on authentication and language selection status
    if (!authenticated) {
      return <Redirect href="/Onboarding" />;
    } else if (!hasCompletedLanguageSelection) {
      return <Redirect href="/LanguageSelection" />;
    } else {
      return <Redirect href="/Home" />;
    }
  }