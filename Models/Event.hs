{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

module Models.Event where
    --for database
    import Control.Applicative
    import Database.SQLite.Simple
    import Database.SQLite.Simple.FromRow
    --for json
    import Data.Aeson.Types
    import GHC.Generics


    data Event = Event Int String deriving (Show, Generic)

    instance FromJSON NewEvent
    instance ToJSON Event

    data NewEvent = NewEvent String deriving (Show, Generic)

    instance FromRow Event where
      fromRow = Event <$> field <*> field

    save :: Connection -> NewEvent -> IO ()
    save conn (NewEvent str) = execute conn "INSERT INTO events (deleted, str) VALUES (0, ?)"
        (Only (str))

    list :: Connection -> IO [Event]
    list conn = query_ conn "SELECT id, str from events where deleted = 0"

    delete :: Connection -> Int -> IO ()
    delete conn id = execute conn "UPDATE events SET deleted = 1 where id = ?" (Only (id))
