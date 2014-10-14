{-# LANGUAGE OverloadedStrings #-}
import Web.Scotty
import Network.Wai.Middleware.Static
import Text.Blaze.Html.Renderer.Text
import qualified Views.Index
import qualified Web.Scotty as S
blaze = S.html . renderHtml

main = scotty 3000 $ do
  get "/" $ do
    blaze Views.Index.render

  middleware $ staticPolicy (noDots >-> addBase "public")

