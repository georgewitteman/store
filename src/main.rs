use serde::Serialize;
use std::convert::Infallible;
use warp::http::StatusCode;
use warp::Filter;

fn root() -> &'static str {
    "Hello, world!"
}

fn test() -> &'static str {
    "This is a test"
}

/// An API error serializable to JSON.
#[derive(Serialize)]
struct ErrorMessage {
    message: String,
}

async fn handle_rejection(err: warp::Rejection) -> Result<impl warp::Reply, Infallible> {
    if err.is_not_found() {
        return Ok(StatusCode::NOT_FOUND);
    }
    Ok(StatusCode::INTERNAL_SERVER_ERROR)
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let index = warp::path::end().map(root);
    let hello = warp::get().and(warp::path("test")).map(test);

    let routes = index.or(hello).recover(handle_rejection);
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
