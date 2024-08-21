import { d1 } from '@lucia-auth/adapter-sqlite';
import type { Adapter, InitializeAdapter } from 'lucia';

type D1Adapter = ReturnType<typeof d1>;

const appAdapter = (d1Adapter: D1Adapter): InitializeAdapter<Adapter> => {
  return (LuciaError) => {
    const d1 = d1Adapter(LuciaError);
    return {
      ...d1,
      setUser: async (user, key) => {
        await d1.setUser(user, key);
      },
      deleteUser: async (userId) => {
        await d1.deleteUser(userId);
      },
      updateUser: async (userId, partialUser) => {
        await d1.updateUser(userId, partialUser);
      },

      setSession: async (session) => {
        await d1.setSession(session);
      },
      deleteSession: async (sessionId) => {
        await d1.deleteSession(sessionId);
      },
      deleteSessionsByUserId: async (userId) => {
        await d1.deleteSessionsByUserId(userId);
      },
      updateSession: async (sessionId, partialSession) => {
        await d1.updateSession(sessionId, partialSession);
      },

      setKey: async (key) => {
        await d1.setKey(key);
      },
      deleteKey: async (keyId) => {
        await d1.deleteKey(keyId);
      },
      deleteKeysByUserId: async (userId) => {
        await d1.deleteKeysByUserId(userId);
      },
      updateKey: async (keyId, partialKey) => {
        await d1.updateKey(keyId, partialKey);
      },
    };
  };
};

export default appAdapter;
