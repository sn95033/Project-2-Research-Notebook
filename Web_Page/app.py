import os

import pandas as pd
import numpy as np

from flask import Flask, jsonify, render_template, make_response
from json import dumps

app = Flask(__name__)

#################################################
# Database Setup
#################################################

articles = pd.read_csv("Input Data/reference.csv")

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/properties")
def mech():
    """Return a list of sample names."""

    properties = ["All","Mechanical","Thermal","Fluid","Electrical"]

    # Return a list of mechanical properties
    return jsonify(properties)

@app.route("/composition")
def therm():
    """Return a list of sample names."""

    composition = ["All","Aluminum","Carbon","Copper","Graphite","Iron","Nickel","Silicon","Silver","Tantalum","Titanium"]

    # Return a list of mechanical properties
    return jsonify(composition)

@app.route("/chord-data")
def chordData():
    data = []
    
    properties = ["Compression Strength","Tensile Strength","Elastic Modulus","Shear Strength","Plasticity","Thermal Conductivity","Thermal Resistivity","Permeability","Pressure Drop","Electrical Resistivity","Electrical Conductivity","Capacitance","Aluminum","Carbon","Copper","Graphite","Iron","Nickel","Silicon","Silver","Tantalum","Titanium","Model"]

    for prop in properties:
        df = articles.groupby(prop).count()
        data_point = []
        for property in properties:
            if property != prop:
                value = df[property]
                data_item = int(value)
                data_point.append(data_item)

            else:
                filtered = articles[articles[property]==property]
            
                for props in properties:
                    if props != property:
                        filtered = filtered[filtered[props]!=props]
                data_item = filtered[property].count()
                data_point.append(data_item)
            
        data.append(str(data_point))


    info = {"data":data,
            "labels":properties
    }

    return jsonify(info)

@app.route("/author-bar-data/<prop>/<comp>")
def AuthorbarData(prop,comp):
    if prop == "All":
        filtered=articles
    else:
        filtered=articles[articles[prop]==prop]
    if comp != "All":
        filtered = filtered[filtered['Composition']==comp]
    # Format the data to send as json
    journals=filtered.groupby('First Author',as_index=False).count().sort_values(by='Title',ascending=False)

    values=[]
    labels=[]

    for i in range(5):
        value=journals.iloc[i]['Authors']
        label = journals.iloc[i]['First Author']
        
        values.append(value)
        labels.append(label)
        
        i=i+1
    data = {
        "values": str(values),
        "labels": str(labels),
    }
    return jsonify(data)

@app.route("/journal-bar-data/<prop>/<comp>")
def JournalbarData(prop,comp):
    if prop == "All":
        filtered=articles
    else:
        filtered=articles[articles[prop]==prop]
    if comp != "All":
        filtered = filtered[filtered['Composition']==comp]
    # Format the data to send as json
    journals=filtered.groupby('Journals',as_index=False).count().sort_values(by='Title',ascending=False)

    values=[]
    labels=[]

    for i in range(5):
        value=journals.iloc[i]['Authors']
        label = journals.iloc[i]['Journals']
        
        values.append(value)
        labels.append(label)
        
        i=i+1
    data = {
        "values": str(values),
        "labels": str(labels),
    }
    return jsonify(data)

@app.route("/bubble-data/<prop>/<comp>")
def bubbleData(prop,comp):
    if prop == "All":
        filtered=articles
    else:
        filtered=articles[articles[prop]==prop]
    if comp != "All":
        filtered = filtered[filtered['Composition']==comp]
    # Format the data to send as json
    data = {
        "year": filtered.Date.values.tolist(),
        "citations": filtered.Citations.values.tolist(),
        "title": filtered.Title.tolist(),
    }
    return jsonify(data)


if __name__ == "__main__":

    app.run()
