{-# LANGUAGE OverloadedStrings #-}

import Database.SQLite.Simple
import Control.Monad.IO.Class

import Web.Scotty
import Network.Wai.Middleware.Static

import qualified Models.Event

listEvents :: IO [Models.Event.Event]
listEvents = do
    conn <- open "events.db"    
    events <- Models.Event.list conn
    close conn
    return events

renderEvents :: ActionM ()
renderEvents = do
    events <- liftIO listEvents
    json events

main = scotty 3000 $ do
    get "/" $ file "public/index.html"

    get "/events" renderEvents

    middleware $ staticPolicy (noDots >-> addBase "public")


    --post /create do
    --    conn <- open "events.db"
    --    Models.Event.save conn $ Models.Event.NewEvent 
    --    close conn
    
    --delete "/events/:id" do
    --    Models.Event.delete conn id
