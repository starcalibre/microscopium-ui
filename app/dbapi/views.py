# using bson.json_util here as json and ujson can't serialise mongo cursors
from bson.json_util import dumps

from flask import request
from . import dbapi
from app import mongo

@dbapi.route("/<screen_id>/treatments/<gene_name>")
def get_treatment(screen_id, gene_name):
    find_query = {"gene_name": gene_name}
    select = request.args.getlist("select")

    select_query = dict()
    select_query["_id"] = False

    for field in select:
        select_query[field] = True

    result = mongo.db.treatments.find(find_query, fields=select_query)

    return dumps(result)

@dbapi.route("/<screen_id>/treatments")
def get_treatments(screen_id):
    find_query = {"screen": screen_id}
    select = request.args.getlist("select")

    select_query = dict()
    select_query["_id"] = False

    for field in select:
        select_query[field] = True

    result = mongo.db.treatments.find(find_query, fields=select_query)

    return dumps(result)

@dbapi.route("/<screen_id>/samples/<sample_id>/images")
def get_images(screen_id, sample_id):
    """Get an image from the images collection.

    Fields to return should be specified using the "select" URL parameter.

    e.g /api/BBBC017/samples/BBBC017-50115070001-A01/images?select=image_large

    Parameters
    ----------
    screen_id : str
        The screen _id the image belongs to.
    sample_id : str
        The sample _id of the image to find.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    find_query = {"sample_id": sample_id}
    select_query = request.args.getlist("select")

    result = mongo.db.images.find(find_query, fields=select_query)

    return dumps(result)


@dbapi.route("/<screen_id>/samples/<sample_id>/images/neighbours")
def get_images_neighbours(screen_id, sample_id):
    """Get the neighbouring images for a sample from the images collection.

    e.g /api/BBBC017/samples/BBBC017-50115070001-A01/images/neighbours?select=image_thumb

    Fields to return should be specified using the "select" URL parameter.

    Parameters
    ----------
    screen_id : str
        The screen _id the image belongs to.
    sample_id : str
        The sample _id of the image to find.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
        Note: Binary data will be returned in the "$binary" subfield.
    """
    find_query = {"_id": sample_id}
    select_query = request.args.getlist("select")

    neighbours = mongo.db.samples.find(find_query,
                                       fields={"_id": False,
                                               "neighbours": True})
    neighbours = neighbours[0]['neighbours']

    result = mongo.db.images.find({"sample_id": {"$in": neighbours}},
                                  fields=select_query)

    return dumps(result)


@dbapi.route("/<screen_id>/features/<feature>")
def get_feature(screen_id, feature):
    """Get the feature distribution from a screen.

    Fields to return should be specified using the "select" URL parameter.

    Parameters
    ----------
    screen_id : str
        The screen _id of the feature to find.
    feature : str
        The feature_name of the feature to find.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    find_query = {"screen": screen_id, "feature_name": feature}
    select_query = request.args.getlist("select")

    result = mongo.db.features.find(find_query, fields=select_query)

    return dumps(result)


@dbapi.route("/<screen_id>/samples")
def get_samples(screen_id):
    """Get all samples belonging to a particular screen.

    Fields to return should be specified using the "select" URL parameter.

    e.g. /api/BBBC017/samples?select=feature_vector_std

    Parameters
    ----------
    screen_id : str
        The screen _id that the samples belong to.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    find_query = {"screen": screen_id}
    select_query = request.args.getlist("select")

    result = mongo.db.samples.find(find_query, fields=select_query)

    return dumps(result)


@dbapi.route("/<screen_id>/samples/<sample_id>")
def get_sample(screen_id, sample_id):
    """Get a sample from from the samples collection.

    Fields to return should be specified using the "select" URL parameter.

    Parameters
    ----------
    screen_id : str
        The query sample _id.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    find_query = {"screen": screen_id, "_id": sample_id}
    select_query = request.args.getlist("select")

    result = mongo.db.samples.find(find_query, fields=select_query)

    return dumps(result)


# this route is defined for consistency with the "/<screen_id>/samples/<sample_id>/images/neighbours" route
@dbapi.route("/<screen_id>/samples/<sample_id>/neighbours")
def get_samples_neighbours(screen_id, sample_id):
    """Get the neighbouring samples for a sample in the collection.

    Fields to return should be specified using the "select" URL parameter.

    Parameters
    ----------
    sample_id : str
        The query sample _id.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    find_query = {"screen": screen_id, "_id": sample_id}

    result = mongo.db.samples.find(find_query,
                                   fields={"_id": False, "neighbours": True})

    return dumps(result)


@dbapi.route("/screens")
def get_screens():
    """Get all screens from the screens collection.

    Fields to return should be specified using the "select" URL parameter.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    select_query = request.args.getlist("select")

    result = mongo.db.screens.find({}, fields=select_query)

    return dumps(result)


@dbapi.route("/screens/<screen_id>")
def get_screen(screen_id):
    """Get a screen from the screens collection.

    Fields to return should be specified using the "select" URL parameter.

    e.g. /api/screens/BBBC017?select=screen_desc&select=screen_features

    Parameters
    ----------
    screen_id : string
        The _id of the query screen.

    Returns
    -------
    result : string
        The result of the database call as a JSON string.
    """
    find_query = {"_id": screen_id}
    select_query = request.args.getlist("select")

    result = mongo.db.screens.find(find_query, fields=select_query)

    return dumps(result)
