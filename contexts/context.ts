import React from 'react';

type UserContextType = {
    userId: string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
};

const UserContext = React.createContext<UserContextType | null>(null);

export default UserContext;
