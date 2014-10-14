{-# LANGUAGE OverloadedStrings #-}

import Web.Scotty
import Network.Wai.Middleware.Static
import qualified Data.Text.Lazy as T

import qualified Views.Index

main = scotty 3000 $ do
  get "/" $ do
    html . T.pack  $ Views.Index.render "trav"

  middleware $ staticPolicy (noDots >-> addBase "public")
